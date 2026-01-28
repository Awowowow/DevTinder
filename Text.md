# Dev Tinder API
# authRouter
    - POST /signup
    - POST /login
    - POST /logout
    
# profileRouter 
    - GET /profile/view
    - PATCH /profile/edit
    - PATCH /profile/password  // forgot password API
    
# Status: ignore, intrested, accepted, rejected

# ConnectionRequestRouter 
    - POST /request/send/intrested/:userId
    - POST /request/send/ignored/:userId 
    - POST /request/review/accepted/:requestId
    - POST /request/review/rejected/:requestId

# user
    - GET /user/connections
    - GET /user/requests/received
    - GET /user/feed - gets u the profiles of the other users on the platform

    /feed?page=1&limit=10 => first 10 1-10 =>  .skin(0) & .limit(10)

    /feed?page=2& lmit=10   => 10-20  .skin(10) & .limit(10)

    /feed?page=2& lmit=10   => 20-30  .skin(20) & .limit(10)



# Corn jobs: for scheduling tasks in the server
# crontab guru for practice if confused

# Date-fns library for date managment


# Payment GateWay
    -


# Web Socket 
    -Client Side
    
    
    -Server Side
        -http from node.js 
        - create a server using app/ express
        - get socket 
        - pass server and cors origin in socket/io

    - Auth Token


MUST DO 
    - AUTH MIDDELE WERE






    chat.participants.filter(msg =>{
      if (msg._id === toUserId){
        return [msg.firstName, msg.lastName, msg.photoUrl]
      }
    })