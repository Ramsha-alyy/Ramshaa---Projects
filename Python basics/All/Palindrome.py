
def is_palindrome(word):
    length = len(word)
    for i in range(length // 2):
        if word[i] != word[length - 1 - i]:
            return False
        return True

text = input("Enter a word: ")

if is_palindrome(text):
    print(f"'{text}' is a palindrome.")
else:
    print(f"'{text}' is not a palindrome. ")

