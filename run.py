print('sachin')

import sys
 

 
# total arguments
print(sys.argv)
lastVersion = sys.argv[1]
currentVersion = sys.argv[2]
n = len(sys.argv)
print("Total arguments passed:", n)


isCurrentVersionCorrect = lastVersion <= currentVersion

print('isCurrentVersionCorrect: ' isCurrentVersionCorrect)
