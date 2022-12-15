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
