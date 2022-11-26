from typing import Dict


def get_email_confirmation_template(args: Dict):
    confirm_url: str = args.get("confirm_url")
    email_code: str = args.get("email_code")
    user_email: str = args.get("user_email")

    if not confirm_url:
        raise Exception("Missing confirm url")
    if not email_code:
        raise Exception("Missing email code")
    if not user_email:
        raise Exception("Missing user email")

    html = f"""
     <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email confirmation</title>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Raleway:ital@0;1&display=swap');
        </style>
    </head>
    <body>
        <div class="view">
          <div style="
          padding: 1em;
          background-color: #2E3440;
          color: #E5E9F0;
          ">
            <div>
              <div>
                <p style="
                  position: absolute;
                  top: 0;
                  right: 0;
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
              <p style="
              font-size: 16px;
              font-weight: 600;
              color: #D8DEE9;
              font-family: 'Raleway', sans-serif;
              ">
                Welcome {user_email}
              </p>
              <p style="
                font-family: 'Raleway', sans-serif;
                font-size: 14px;
              ">
                You sign up in the authentication app
              </p>
              <p style="
                font-family: 'Raleway', sans-serif;
                font-size: 14px;
              ">
                In order to use the application make sure to confirm you account by clicking on the following link
              </p>
              <a 
              href='{confirm_url}' 
              style="
                text-decoration: none;
                padding: 0.3em 0.8em;
                text-transform: uppercase;
                outline: none;
                border: none;
                background-color: #8FBCBB;
                transition: all 0.5s ease-out;
                font-weight: 600;
                font-size: 14px;
                border-radius: 5px;
                font-family: 'Raleway', sans-serif;
                color: #2E3440;
               ">
                 Confirm Account
              </a>
            </div>
          </div>
        </div>
    </body>
    </html>
    """

    return html
