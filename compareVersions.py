import sys
from collections import defaultdict
from github import Github


print(sys.argv)
# n = len(sys.argv)

# if n == 3:
#  lastVersion = sys.argv[1]
#  currentVersion = sys.argv[2]
#  print(lastVersion <= currentVersion)
# else:
#  print('INVALID ARGS')
 
g = Github("27b2348795b4d646b996b04090b14d22cf7eccdd ")

# Then play with your Github objects:
for repo in g.get_user().get_repos():
    print(repo.name)

# g = Github(sys.argv[3])

# print(g)
# for repo in g.get_user().get_repos():
#     print(repo.name)
  




