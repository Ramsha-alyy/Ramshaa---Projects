def check_login(username, password):
    if username == "admin" and password == "1234":
        return True
    else:
        return False
    
attempts = 0
while attempts < 3:
        user = input("Enter name")
        pwd = input("Enter user password")

        if check_login(user,pwd):
            print("Welcome, Admin!")
            break
        else:
            print("Incorrect Login! Please Try Again.")
            attempts += 1

if attempts == 3:
     print("Too many failed attempts! Access Denied")

 
