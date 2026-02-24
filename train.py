import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

df = pd.read_csv("Datasets/Energy_consumption.csv")

features = ['Temperature', 'Humidity']
X = df[features]
y = df['EnergyConsumption']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print("MAE:", round(mean_absolute_error(y_test, preds), 2))

joblib.dump(model, "energy_model.pkl")
print("✅ Model saved")