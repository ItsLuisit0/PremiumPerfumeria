-- =====================================================
-- ACTUALIZAR URLs DE IMÁGENES EN LA BASE DE DATOS
-- =====================================================
-- Este script actualiza la columna imagen_url en la tabla perfumes
-- con las URLs correctas desde la carpeta ImagenesPerfumes/
-- =====================================================

USE perfumeria2;

-- Perfumes Masculinos
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Eros_Flame.jpg' WHERE nombre = 'Eros Flame';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Sauvage.png' WHERE nombre = 'Sauvage';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Fakhar.png' WHERE nombre = 'Fakhar';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Bad_Boy.PNG' WHERE nombre = 'Bad Boy';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Bleu_de_Chanel.PNG' WHERE nombre = 'Bleu de Chanel';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/aventus.png' WHERE nombre = 'Aventus';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Explorer.png' WHERE nombre = 'Explorer';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Club_de_Nuit_Sillage.PNG' WHERE nombre = 'Club de Nuit Sillage';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/212_Men_Sexy.PNG' WHERE nombre = '212 Men Sexy';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Club_de_Nuit_Intense_Man.PNG' WHERE nombre = 'Club de Nuit Intense Man';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Hawas_for_Him.PNG' WHERE nombre = 'Hawas for Him';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Asad_(Original).PNG' WHERE nombre = 'Asad (Original)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Asad_Bourbon.PNG' WHERE nombre = 'Asad Bourbon';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Le_Male_Elixir.PNG' WHERE nombre = 'Le Male Elixir';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Le_Male_Le_Parfum.png' WHERE nombre = 'Le Male Le Parfum';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Le_Male_Pride_Edition.PNG' WHERE nombre = 'Le Male Pride Edition';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Le_Beau_Le_Parfum.PNG' WHERE nombre = 'Le Beau Le Parfum';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Le_Beau_Paradise_Garden.jpg' WHERE nombre = 'Le Beau Paradise Garden';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Uomo_Born_in_Roma_Intense.jpg' WHERE nombre = 'Uomo Born in Roma Intense';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Uomo_Born_in_Roma_Coral_Fantasy.jpg' WHERE nombre = 'Uomo Born in Roma Coral Fantasy';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Acqua_di_Giò_Profumo.jpg' WHERE nombre = 'Acqua di Giò Profumo';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Scandal_Le_Parfum_Pour_Homme.jpg' WHERE nombre = 'Scandal Le Parfum Pour Homme';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Y.jpg' WHERE nombre = 'Y';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Legend.jpg' WHERE nombre = 'Legend';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/9_AM_Dive.PNG' WHERE nombre = '9 AM Dive';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/9_PM.jpg' WHERE nombre = '9 PM';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/9_PM_Rebel.PNG' WHERE nombre = '9 PM Rebel';

-- Perfumes Femeninos
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Sweet_Like_Candy.jpg' WHERE nombre = 'Sweet Like Candy';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Yara_Moi_(Blanco_Rosa).PNG' WHERE nombre = 'Yara Moi (Blanco/Rosa)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Yara_(Rosa).PNG' WHERE nombre = 'Yara (Rosa)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Yara_Tous_(Naranja).PNG' WHERE nombre = 'Yara Tous (Naranja)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Be_Delicious_Fresh_Blossom.jpg' WHERE nombre = 'Be Delicious Fresh Blossom';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/212_0NYC_Women.jpg' WHERE nombre = '212 NYC Women';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Cheap_and_Chic-Hippy__Fizz.jpg' WHERE nombre = 'Cheap and Chic - Hippy Fizz';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Cheap_and_Chic–_Chic_Petals.jpg' WHERE nombre = 'Cheap and Chic – Chic Petals';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Cloud.jpg' WHERE nombre = 'Cloud';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Coco_Mademoiselle.jpg' WHERE nombre = 'Coco Mademoiselle';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Eclaire.jpg' WHERE nombre = 'Eclaire';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Very_Good_Girl.jpg' WHERE nombre = 'Very Good Girl';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Odyssey_Candee_(Special_Edition).jpg' WHERE nombre = 'Odyssey Candee (Special Edition)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Toy_2_Bubble_Gum.jpg' WHERE nombre = 'Toy 2 Bubble Gum';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Yara_Moi.jpg' WHERE nombre = 'Yara Moi';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Amor_Amor.jpg' WHERE nombre = 'Amor Amor';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Thank_U_Next.jpg' WHERE nombre = 'Thank U Next';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Be_Delicious.jpg' WHERE nombre = 'Be Delicious';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Fruit_Collection-Lemon.jpg' WHERE nombre = 'Fruit Collection - Lemon';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Fruit_Collection_Orange.jpg' WHERE nombre = 'Fruit Collection Orange';

-- Perfumes Unisex
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Khamrah_(Original).jpg' WHERE nombre = 'Khamrah (Original)';
UPDATE perfumes SET imagen_url = 'ImagenesPerfumes/Baccarat_Rouge_540.jpg' WHERE nombre = 'Baccarat Rouge 540';

-- Verificar actualización
SELECT nombre, imagen_url FROM perfumes WHERE activo = TRUE ORDER BY nombre;

-- Contar perfumes con y sin imagen
SELECT 
    COUNT(*) as total_perfumes,
    SUM(CASE WHEN imagen_url IS NOT NULL THEN 1 ELSE 0 END) as con_imagen,
    SUM(CASE WHEN imagen_url IS NULL THEN 1 ELSE 0 END) as sin_imagen
FROM perfumes 
WHERE activo = TRUE;

