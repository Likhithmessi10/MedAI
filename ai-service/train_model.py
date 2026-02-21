import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

print("Loading patient files...")

data_folderA = "../datasets/training_setA"
data_folderB = "../datasets/training_setB"

rows = []

def process_folder(folder):
    for file in os.listdir(folder):
        if file.endswith(".psv"):
            path = os.path.join(folder, file)
            df = pd.read_csv(path, sep="|")

            df = df.ffill().fillna(0)

            # take last row = latest patient condition
            last = df.iloc[-1]

            rows.append(last)

process_folder(data_folderA)
process_folder(data_folderB)

print("Creating dataset from final patient states...")
data = pd.DataFrame(rows)

# target
y = data["SepsisLabel"]

# important clinical features
features = [
    "HR","O2Sat","Temp","SBP","MAP","Resp","Age","WBC","Platelets","Creatinine"
]

# keep only available columns
features = [f for f in features if f in data.columns]
X = data[features]

print("Training clinical model...")
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = RandomForestClassifier(n_estimators=120,max_depth=8)
model.fit(X_train,y_train)

acc = model.score(X_test,y_test)
print("Clinical Model Accuracy:",acc)


joblib.dump(model, "sepsis_model.pkl")
joblib.dump(X.columns.tolist(), "model_features.pkl")

print("Model saved successfully (joblib)")

print("Model saved successfully")