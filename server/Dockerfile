FROM tiangolo/uvicorn-gunicorn-fastapi
RUN pip install --upgrade pip

# install packages
RUN mkdir /src
ADD requirements.txt /src
RUN pip install -r /src/requirements.txt

ADD ./src /src
WORKDIR /

EXPOSE 8000
RUN mkdir /config
ENV TT_CONFIG_DIR=/config
ENTRYPOINT ["uvicorn", "--host", "0.0.0.0", "src:app"]