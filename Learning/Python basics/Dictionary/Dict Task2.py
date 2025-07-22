name = input("Enter name")
marks = int(input("Enter student marks"))


if marks >=90:
    grade = "A+"

if marks >= 80:
    grade = "A"
elif marks >= 70:
    grade = "B"
elif marks >= 60:
    grade = "C"
elif marks >= 50:
    grade = "D"
else:
    grade = "fail"
print(f"{name} got {marks} marks and received grade {grade}")