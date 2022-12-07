import jwt
from datetime import datetime, timedelta

def make_token(dbData):
    token = jwt.encode(
    {
        "id" : dbData[0],
        "name" : dbData[1],
        "email" : dbData[2],
    },
    "BA1D43F21E93570D2F2B569570813D591C2FD38E8C8E52B195B4C6712B676B36",
    algorithm = "HS256")
    return token

def decode_token(dbToken):
    decodeToken = jwt.decode(
        dbToken,
        "BA1D43F21E93570D2F2B569570813D591C2FD38E8C8E52B195B4C6712B676B36",
        algorithms = "HS256"
    )
    return decodeToken 
