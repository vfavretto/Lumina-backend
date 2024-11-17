@echo off

REM Step 1: Build the Project
echo Building the project...
call npm run build

REM Step 2: Copy package.json to the dist folder
echo Copying package.json to the dist folder...
call copy package.json dist\

REM Step 3: Deploy to Vercel with environment variable
echo Deploying to Vercel with STAGING=true...
set STAGING=true
call vercel --env STAGING=%STAGING%

echo Deployment Complete.