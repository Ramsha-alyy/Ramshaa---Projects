num = int(input("Enter a number"))
if num == 0:
    print("Zero is neither positive nor negative")
elif num < 0:
    print("Negative Number")

else:
    if num % 2 == 0 :
        print("Number is even")
    else:
        print("Number is odd")