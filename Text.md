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

