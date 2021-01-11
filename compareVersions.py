import sys
from collections import defaultdict
# from github import Github

# argumnts
# 1. LastVersion
# 2. Current Version

# print(sys.argv)
n = len(sys.argv)

if n == 3:
 lastVersion = sys.argv[1]
 currentVersion = sys.argv[2]
 print(lastVersion >= currentVersion)
else:
 print('INVALID ARGUMENTS')
 

# g = Github(sys.argv[3])

# print(g)
# for repo in g.get_user().get_repos():
#     print(repo.name)
  




