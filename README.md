# CS340-Group-Project
CS340 term group project


## Deployment

Run command:
```
cd deployment
chmod 777 run.sh
./run.sh deploy
```

## Accessing the service

Docker should map internal port 80 to external port 8000. This can be changed in the run script.

Try this sending this request from the computer running the container to test if online:
```
GET http://localhost:8000/Test
>> HTTP 200 OK
```
