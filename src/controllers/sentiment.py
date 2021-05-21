import sys
from textblob import TextBlob
analysis = TextBlob(sys.argv[1])
if analysis.sentiment.polarity > 0:
    print("1")
elif analysis.sentiment.polarity == 0:
    print("0")
else:
    print("-1")