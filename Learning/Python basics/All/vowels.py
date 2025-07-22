#Vowels
def vowel(v):
    vowels = 'aeiou'
    found = set()

    for char in v.lower():
        if char in vowels:
            found.add(char)

    return len(found)


a = input("Enter a string: ")

print(vowel(a))

