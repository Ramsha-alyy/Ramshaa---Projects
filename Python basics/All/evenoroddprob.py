#even or odd

times = int(input("How many times do you want to check?"))
def check_even_odd(times):
    for _ in range(times):
        num = int(input("Enter a number:"))
        if num % 2 == 0:
            print(f"{num} is even.")
        else:
            print(f"{num} is odd.") 

print(check_even_odd(times))
