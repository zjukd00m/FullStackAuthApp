from typing import Dict

def get_on_email_code_changed_template(args: Dict):
    new_email_code = args.get("new_email_code")
    old_email_code = args.get("old_email_code")

    if not new_email_code:
        raise ValueError("Missing new email code")

    if not old_email_code:
        raise ValueError("Missing old email code") 

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
                     "> {new_email_code} </span>
                    </p>
                    </div>
                    <p
                      style="
                        font-size: 14px;
                        color: #D8DEE9;
                      "
                    >
                       You changed your email code. 
                    <p
                      style="
                        font-size: 14px;
                        color: #D8DEE9;
                      "
                    >
                       The one that appears at the top of the message
                       is the new one and the following is the older one: 
                       <span
                         style="
                           font-size: 16px;
                           color: #D08770;
                           font-family: 'Space Mono', monospace;
                           font-weight: 700;
                           border-bottom: 2px solid #D08770;
                         "
                       > {old_email_code} </span>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html
