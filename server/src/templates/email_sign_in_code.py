from typing import Dict


def get_email_sign_in_code_template(args: Dict):
    email_code = args.get("email_code")
    sign_in_token = args.get("sign_in_token")

    if not email_code:
        raise Exception("Missing email code")

    if not sign_in_token:
        raise Exception("Missing sign in token")

    html = F"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> Sign in code </title>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Raleway:ital@0;1&display=swap');
        </style>
    </head>
    <body>
        <div class="view">
            <div
                style="
                padding: 1em;
                background-color: #2E3440;
                color: #E5E9F0;
            ">
                <div>
                    <div>
                    <p style="
                      font-size: 14px;
                      margin: 1em 1em 0 0;
                      font-family: 'Raleway', sans-serif;
                    ">
                      Authentication code:        
                      <span style="
                       text-align: center;
                       font-family: 'Space Mono', monospace;
                       font-weight: 700;
                       color: #EBCB8B;
                       border-bottom: 2px solid #EBCB8B;
                       font-size: 16px;   
                     "> {email_code} </span>
                    </p>
                    </div>
                    <p
                      style="
                        font-size: 14px;
                        color: #D8DEE9;
                      "
                    >
                       To have access to the application a token was requested for you to sign in:
                    </p>
                    <p
                      style="
                        font-size: 18px;
                        font-family: 'Space Mono', monospace;
                        font-weight: 600;
                      "
                    >
                      {sign_in_token}
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    return html
