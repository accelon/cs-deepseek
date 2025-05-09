copy ..\acc3x64\dist\acc3.com dist\cs-deepseek.com
cd dist
@rem do not include sw.js 
zip cs-deepseek.com index.css index.html index.js global.css cs-deepseek.png cs-deepseek512.png offline.html
zip cs-deepseek.com -d accelon3.png accelon3_512.png
cs-deepseek.com
cd ..
