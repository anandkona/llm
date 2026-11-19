-- ==============================================================================
-- Academic Structure, Courses, Subjects & User Mappings Schema
-- Database: llm
-- ==============================================================================

USE `llm`;

-- 1. Universities Table
CREATE TABLE IF NOT EXISTS `universities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `domain` VARCHAR(191) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_universities_code` (`code`),
  INDEX `idx_universities_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(25) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('Super Admin', 'University Admin', 'Faculty', 'Student') NOT NULL DEFAULT 'Student',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_university` 
    FOREIGN KEY (`university_id`) 
    REFERENCES `universities` (`id`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_university` (`university_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Password Resets Table
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_password_resets_token` (`token`),
  INDEX `idx_password_resets_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_dept_university_code` (`university_id`, `code`),
  CONSTRAINT `fk_dept_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_dept_university` (`university_id`),
  INDEX `idx_dept_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Academic Years Table
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `year_name` VARCHAR(50) NOT NULL, -- e.g. "2025-2026"
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_current` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_year_university_name` (`university_id`, `year_name`),
  CONSTRAINT `fk_year_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_year_university` (`university_id`),
  INDEX `idx_year_is_current` (`is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Semesters Table
CREATE TABLE IF NOT EXISTS `semesters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `academic_year_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL, -- e.g. "Semester 1", "Fall 2026"
  `term` ENUM('Fall', 'Spring', 'Summer', 'Winter', 'Yearly') NOT NULL DEFAULT 'Fall',
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_semester_year_name` (`academic_year_id`, `name`),
  CONSTRAINT `fk_sem_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sem_year`
    FOREIGN KEY (`academic_year_id`)
    REFERENCES `academic_years` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_sem_university` (`university_id`),
  INDEX `idx_sem_year` (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Courses (Programs/Degrees) Table
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL, -- e.g. "B.Tech Computer Science"
  `code` VARCHAR(50) NOT NULL, -- e.g. "BT-CSE"
  `duration_years` INT NOT NULL DEFAULT 4,
  `total_semesters` INT NOT NULL DEFAULT 8,
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_course_university_code` (`university_id`, `code`),
  CONSTRAINT `fk_course_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_department`
    FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_course_university` (`university_id`),
  INDEX `idx_course_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `semester_id` INT NULL,
  `name` VARCHAR(150) NOT NULL, -- e.g. "Data Structures & Algorithms"
  `code` VARCHAR(50) NOT NULL, -- e.g. "CS201"
  `credits` INT NOT NULL DEFAULT 3,
  `type` ENUM('Theory', 'Practical', 'Theory & Practical', 'Elective') NOT NULL DEFAULT 'Theory',
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_subject_course_code` (`course_id`, `code`),
  CONSTRAINT `fk_subject_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subject_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_subject_semester`
    FOREIGN KEY (`semester_id`)
    REFERENCES `semesters` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_subject_university` (`university_id`),
  INDEX `idx_subject_course` (`course_id`),
  INDEX `idx_subject_semester` (`semester_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Student Mappings Table (Student -> Department, Course, Semester)
CREATE TABLE IF NOT EXISTS `student_mappings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `academic_year_id` INT NOT NULL,
  `semester_id` INT NOT NULL,
  `roll_number` VARCHAR(50) NULL,
  `enrollment_date` DATE NULL,
  `status` ENUM('active', 'completed', 'dropped', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_enrollment` (`student_id`, `course_id`, `semester_id`),
  CONSTRAINT `fk_map_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_map_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_map_dept`
    FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_map_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_map_year`
    FOREIGN KEY (`academic_year_id`)
    REFERENCES `academic_years` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_map_semester`
    FOREIGN KEY (`semester_id`)
    REFERENCES `semesters` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_map_student` (`student_id`),
  INDEX `idx_map_dept` (`department_id`),
  INDEX `idx_map_course` (`course_id`),
  INDEX `idx_map_semester` (`semester_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Faculty Subject Assignments Table (Faculty -> Subjects)
CREATE TABLE IF NOT EXISTS `faculty_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT NOT NULL,
  `faculty_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `semester_id` INT NULL,
  `role_title` VARCHAR(100) DEFAULT 'Lead Instructor',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_faculty_subject_sem` (`faculty_id`, `subject_id`, `semester_id`),
  CONSTRAINT `fk_fac_user`
    FOREIGN KEY (`faculty_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fac_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fac_subject`
    FOREIGN KEY (`subject_id`)
    REFERENCES `subjects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fac_sem`
    FOREIGN KEY (`semester_id`)
    REFERENCES `semesters` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_fac_faculty` (`faculty_id`),
  INDEX `idx_fac_subject` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
