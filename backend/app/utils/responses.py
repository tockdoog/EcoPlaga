# backend/app/utils/responses.py
from fastapi import JSONResponse

def ok(data=None, message="OK"):
    return JSONResponse(status_code=200, content={"message": message, "data": data})

def created(data=None, message="Created"):
    return JSONResponse(status_code=201, content={"message": message, "data": data})

def error(message="Error", status_code=400):
    return JSONResponse(status_code=status_code, content={"message": message})
