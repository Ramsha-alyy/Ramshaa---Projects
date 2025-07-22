#Reverse a string
string = "Hello"
def reversed_string(s):
  reversed_s = " "
  for char in s:
    reversed_s += char 
  return reversed_s
result = reversed_string(string)
print(result)