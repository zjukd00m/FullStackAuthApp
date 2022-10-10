from fastapi import HTTPException
import pytest


def hello():
    return 3


def goodbay():
    raise HTTPException(404, "user.not-found")


# Test using functions
def test_hello():
    assert hello() == 3


def test_goodbay():
    with pytest.raises(HTTPException):
        goodbay()


# Test using class
class TestSignUp:
    def test_hello(self):
        assert hello() == 3

    def test_goodbay(self):
        with pytest.raises(HTTPException):
            goodbay()


class TestSignIn:
    def test_signin(self):
        assert True == True
