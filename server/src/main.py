import pprint
from typing import Union

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from starlette.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY

from views import forecast, packing_list, trip_plan, partners, auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def http422_error_handler(
    _, exc: Union[RequestValidationError, ValidationError]
) -> JSONResponse:
    pprint.pprint(exc.errors())
    return JSONResponse(
        {"errors": exc.errors()}, status_code=HTTP_422_UNPROCESSABLE_ENTITY
    )


app.add_exception_handler(ValidationError, http422_error_handler)
app.add_exception_handler(RequestValidationError, http422_error_handler)

app.include_router(forecast.router)
app.include_router(packing_list.router)
app.include_router(trip_plan.router)
app.include_router(partners.router)
app.include_router(auth.router)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")