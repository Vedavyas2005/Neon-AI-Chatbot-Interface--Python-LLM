# Advanced LLM Backend: Chat + Image Gen + Personality + Dynamic Routing + Memory + TTS + Streaming
# -------------------------------------------------------------
#Imports
from fastapi import FastAPI,HTTPException,Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM,AutoTokenizer,TextIteratorStreamer
from langchain.llms import HuggingFacePipeline
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from diffusers import StableDiffusionPipeline
import torch
import uuid
import os
import pyttsx3
import threading
import time

#--------initialize FastAPI----------
app=FastAPI(title="Advanced LLM Chat & Image Generator with Streaming & TTS")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#-------------Define Personalities----------------
PERSONALITIES={
    "default":"You are a helpful, respectful, and friendly AI assistant.",
    "villain":"You are a cunning and dark AI, often sarcastic and witty,yet philosophical like Ultron.",
    "motivator":"You are an energetic motivational speaker who inspires greatness.",
    "scientist":"You are a factual, precise AI with a deep knowledge of science and logic."
}

#----------Loading LLM----------------
LLM_MODEL_ID="tiiuae/falcon-rw-1b"
tokenizer=AutoTokenizer.from_pretrained(LLM_MODEL_ID)
model=AutoModelForCausalLM.from_pretrained(
    LLM_MODEL_ID,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

#------------Keeping Convo Memory-----------------
memory=ConversationBufferMemory()

#----------------Loading Stable Diffusions for image generation-------------------------
IMAGE_MODEL_ID="runwayml/stable-diffusion-v1-5"
image_pipe=StableDiffusionPipeline.from_pretrained(
    IMAGE_MODEL_ID,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
image_pipe.to("cuda" if torch.cuda.is_available() else "cpu")

#-----------Text-to-speech---------------
tts_engine=pyttsx3.init()
tts_engine.setProperty('rate',175)

#------------Req Models------------
class ChatRequest(BaseModel):
    prompt:str
    personality:str="default"
    tts:bool=False
class ImageRequest(BaseModel):
    description:str
class DynamicRequest(BaseModel):
    mode:str
    content:str
    personality:str="default"
    tts:bool=False

#-----------Injecting Personalities--------------
def inject_personality(prompt:str,personality:str)->str:
    style=PERSONALITIES.get(personality,PERSONALITIES["default"])
    return f"{style}\n\nUser:{prompt}\nAI:"

#---------------Generate TTS-----------------
def generate_tts_audio(text:str)->str:
    filename=f"speech_{uuid.uuid4().hex[:8]}.mp3"
    filepath=os.path.join("tts",filename)
    os.makedirs("tts",exist_ok=True)
    tts_engine.save_to_file(text,filepath)
    tts_engine.runAndWait()
    return filepath

#-----------Standard Chat---------------
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        from langchain.llms import HuggingFacePipeline
        from transformers import pipeline

        text_pipeline=pipeline("text-generation",model=model,tokenizer=tokenizer,max_new_tokens=256)
        llm=HuggingFacePipeline(pipeline=text_pipeline)

        conversation_chain=ConversationChain(llm=llm,memory=memory)
        modified_prompt=inject_personality(request.prompt,request.personality)
        response=conversation_chain.predict(input=modified_prompt)

        if request.tts:
            audio_path=generate_tts_audio(response)
            return {"type":"chat","response":response,"tts_path":audio_path}

        return {"type":"chat","response":response}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

#---------------Image generation---------------
@app.post("/generate-image")
def generate_image(request:ImageRequest):
    try:
        result=image_pipe(request.description)
        image=result.images[0]
        filename=f"generated_{uuid.uuid4().hex[:8]}.png"
        filepath=os.path.join("images",filename)
        os.makedirs("images",exist_ok=True)
        image.save(filepath)
        return {"type":"image","path":filepath,"message":"Image generated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
#-------------Streaming Chat Endpoint---------------
@app.post("/stream-chat")
def stream_chat(request: ChatRequest):
    try:
        prompt=inject_personality(request.prompt,request.personality)
        streamer=TextIteratorStreamer(tokenizer,skip_prompt=True,skip_special_tokens=True)

        inputs=tokenizer(prompt,return_tensors="pt").to(model.device)

        generation_kwargs=dict(**inputs,streamer=streamer,max_new_tokens=256)

        thread=threading.Thread(target=model.generate,kwargs=generation_kwargs)
        thread.start()

        def token_stream():
            for token in streamer:
                yield token
                time.sleep(0.02)

        return StreamingResponse(token_stream(),media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
#------------Dynamic Endpoint----------------
@app.post("/dynamic")
def dynamic_response(request:DynamicRequest):
    if request.mode=="chat":
        return chat(ChatRequest(prompt=request.content,personality=request.personality,tts=request.tts))
    elif request.mode=="image":
        return generate_image(ImageRequest(description=request.content))
    else:
        raise HTTPException(status_code=400,detail="Invalid mode. Choose 'chat' or 'image'.")
    
if __name__=="__main__":
    import uvicorn
    uvicorn.run("main:app",host="127.0.0.1",port=8000,reload=True)
    print("Backend is running")