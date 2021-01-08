import sys
 
n = len(sys.argv)

if n == 3:
 lastVersion = sys.argv[1]
 currentVersion = sys.argv[2]
 print(lastVersion <= currentVersion)
else:
 print('INVALID ARGS')
