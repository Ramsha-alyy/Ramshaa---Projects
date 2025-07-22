

def string_length(s):
    count = 0
    for char in s:
        count += 1
    return count

a = input("Enter a string: ")

length = string_length(a)
print("Length of the string:", length)