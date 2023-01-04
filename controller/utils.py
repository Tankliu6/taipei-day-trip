import re

# regular expression (regex)
# regular expression for digital number
def regexDigitalNumber(number):
    digital_number_regex = r"\d+"
    regexResult = re.match(digital_number_regex, number)
    if(regexResult):
        return True
    else:
        return False
        
# regular expression for date in the format YYYY-MM-DD
def regexDate(date):
    date_regex = r"\d{4}-\d{2}-\d{2}"
    regexResult = re.match(date_regex, date)
    if(regexResult):
        return True
    else:
        return False

# regular expression for 上半天 or 下半天 (time)
def regexTime(time):
    time_regex = r"上半天|下半天"
    regexResult = re.match(time_regex, time)
    if(regexResult):
        return True
    else:
        return False

# regular expression for sign-up-name
def regexName(name):
    name_regex = r"^[\w\u4E00-\u9FFF]([^<>\s]){1,20}$"
    regexResult = bool(re.match(name_regex, name))
    return regexResult

# regular expression for sign-up-email
def regexEmail(email):
    email_regex = r"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$"
    regexResult = bool(re.match(email_regex, email))
    return regexResult

# regular expression for sign-up-password
def regexPassword(password):
    password_regex = r"^[\w]([^<>\s]){7,20}$"
    regexResult = bool(re.match(password_regex, password))
    return regexResult

# regular expression for phone
def regexPhone(phone):
    phone_regex = r'^\d{10}$'
    regexResult = bool(re.match(phone_regex, phone))
    return regexResult