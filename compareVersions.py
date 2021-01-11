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
 
# or using an access token
g1 = Github("9beedbcec452953a25d2ca629bcce3c0f9512fee")

# Then play with your Github objects:
for repo in g1.get_user().get_repos():
    print(repo.name)

g = Github(sys.argv[3])

print(g)
for repo in g.get_user().get_repos():
    print(repo.name)
  




