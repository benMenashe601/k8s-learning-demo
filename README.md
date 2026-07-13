# Kubernetes Learning Demo

אפליקציה קטנה ומבודדת לתרגול Docker ו־Kubernetes:

- **Frontend** — דף סטטי שמוגש על ידי Nginx וטוען משתני סביבה בזמן עליית הקונטיינר.
- **Backend** — API ב־Node.js עם health checks ושם ה־Pod שממנו הגיעה התשובה.
- **Database** — PostgreSQL ששומר ביקור חדש בכל טעינת דף.
- **Kubernetes** — Deployments, Services, ConfigMap, Secret, probes, שני replicas ו־StatefulSet עם אחסון קבוע.

## הרצה עם Docker Compose

מתוך התיקייה הזאת:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

פתח [http://localhost:8080](http://localhost:8080). במסך תראה אם ה־Backend וה־Database מחוברים, את משתני הסביבה ואת הרשומות האחרונות שנשמרו.

לעצירה:

```powershell
docker compose down
```

כדי למחוק גם את נתוני PostgreSQL:

```powershell
docker compose down -v
```

## ניסויים טובים ללימוד Docker

1. שנה את `APP_NAME`, `WELCOME_MESSAGE` או `THEME_COLOR` בקובץ `.env` והרם מחדש את ה־Frontend.
2. עצור רק את בסיס הנתונים עם `docker compose stop database` וראה את ה־readiness נכשל.
3. בדוק לוגים עם `docker compose logs -f backend`.
4. היכנס ל־DB עם:

```powershell
docker compose exec database psql -U demo -d demo -c "SELECT * FROM visits;"
```

## הרצה ב־Kubernetes מקומי

הדוגמה מניחה Docker Desktop Kubernetes, שבו NodePort זמין דרך `localhost`.

בנה את התמונות בשמות שמופיעים ב־manifests:

```powershell
docker build -t k8s-learning-demo-backend:local ./backend
docker build -t k8s-learning-demo-frontend:local ./frontend
kubectl apply -f ./k8s
kubectl wait --for=condition=ready pod --all -n k8s-learning-demo --timeout=120s
```

פתח [http://localhost:30080](http://localhost:30080). ה־Frontend פונה ל־Backend ב־`http://localhost:30081`.

פקודות שימושיות:

```powershell
kubectl get all -n k8s-learning-demo
kubectl get pods -n k8s-learning-demo -w
kubectl logs -n k8s-learning-demo deployment/backend -f
kubectl scale deployment backend -n k8s-learning-demo --replicas=4
kubectl rollout restart deployment/frontend -n k8s-learning-demo
```

שינוי ConfigMap לדוגמה:

```powershell
kubectl edit configmap demo-config -n k8s-learning-demo
kubectl rollout restart deployment/frontend -n k8s-learning-demo
```

ניקוי מלא:

```powershell
kubectl delete namespace k8s-learning-demo
```

> ה־Secret מכיל סיסמת דמו בלבד. בפרויקט אמיתי לא שומרים secrets גלויים ב־Git.
