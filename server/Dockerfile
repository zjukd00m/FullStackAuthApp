FROM python:3.9.14-bullseye

WORKDIR /app

COPY ./requirements.txt /app/

RUN pip install --upgrade pip 
RUN pip install -r requirements.txt

COPY src .
COPY main.py .
COPY gunicorn.conf.py

EXPOSE 8088

CMD ["python", "main.py"]
