import uvicorn

if __name__ == "__main__":
    uvicorn.run("src.index:app", port=8088, host="0.0.0.0", reload=True)
