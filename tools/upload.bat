cd /D "%~dp0"
cd ..
del upload\*.* /Q 
tar.exe -cf upload/SourceCode.zip code code-utils index.js
xcopy /s out upload