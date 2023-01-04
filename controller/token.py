import jwt, os
from dotenv import load_dotenv
load_dotenv()
def make_token(dbData):
    token = jwt.encode(
    {
        "id" : dbData[0],
        "name" : dbData[1],
        "email" : dbData[2],
    },
    os.getenv('JWTSECRET'),
    algorithm = "HS256")
    return token

def decode_token(dbToken):
    decodeToken = jwt.decode(
        dbToken,
        os.getenv('JWTSECRET'),
        algorithms = "HS256"
    )
    return decodeToken 
