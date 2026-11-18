# Database Backup & Restore Guide

This guide covers operational procedures for creating backups and restoring the **`llm`** MySQL database.

---

## 📋 Database Information

- **Database Name:** `llm`
- **Default Port:** `3306`
- **Default User:** `root`
- **Host:** `localhost`
- **Tooling:** `mysqldump`, `mysql` CLI, or phpMyAdmin (XAMPP)

---

## 💾 1. Database Backup Instructions

### Option A: Command Line (`mysqldump`)

To create a full SQL dump including schema and data:

#### Windows PowerShell / Command Prompt:
```powershell
# Navigate to backup destination
cd D:\llm\llm\database

# Generate backup with timestamp (replace password with -pYourPassword if configured)
& "C:\xampp\mysql\bin\mysqldump.exe" -u root -p llm --routines --triggers --single-transaction > "backup_llm_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```

#### Linux / macOS:
```bash
mysqldump -u root -p llm --routines --triggers --single-transaction > backup_llm_$(date +%Y%m%d_%H%M%S).sql
```

### Option B: phpMyAdmin GUI

1. Open [http://localhost/phpmyadmin/index.php?route=/database/structure&db=llm](http://localhost/phpmyadmin/index.php?route=/database/structure&db=llm).
2. Click on the **Export** tab in the top navigation bar.
3. Select **Export method:** `Quick` (or `Custom` if you want to inspect table-specific options).
4. Select **Format:** `SQL`.
5. Click **Export** to download `llm.sql`.

---

## 🔄 2. Database Restore Instructions

### Option A: Command Line (`mysql`)

#### Step 1: Ensure the database exists
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS llm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### Step 2: Restore from your backup file
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -p llm < "D:\llm\llm\database\backup_file.sql"
```

### Option B: phpMyAdmin GUI

1. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
2. Select database **`llm`** from the left sidebar (or create it if it does not exist).
3. Click the **Import** tab.
4. Under **File to import**, click **Choose File** and select your `.sql` backup file.
5. Click **Import** at the bottom of the page.

---

## ⚡ 3. Initial Setup & Seed

If setting up a fresh development or staging environment:

1. Run the initial table migration script:
   ```powershell
   & "C:\xampp\mysql\bin\mysql.exe" -u root llm < "D:\llm\llm\database\init.sql"
   ```
2. Seed initial sample universities and role-based test users:
   ```powershell
   cd D:\llm\llm\backend
   node src/config/seed.js
   ```

---

## 🛡️ Best Practices & Retention

1. **Automated Cron / Task Scheduler:** Schedule daily incremental or full dumps during off-peak hours.
2. **Offsite Storage:** Encrypt and store backups on isolated storage (e.g., S3, Google Cloud Storage, or external drive).
3. **Pre-Deployment Snapshots:** Always execute an ad-hoc backup before running migration scripts or schema alterations.
