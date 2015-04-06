###Instamood

####Setup Instructions:

This is built on nodejs and the express web framework.

 - Install `node`, `nodemon`, `npm` and `express`. See instructions from their respective web sites since they vary by platform.
 - `cd instamood`
 - `npm install`
 - Copy `config.yaml.example` to `config.yaml`. Ask @rahij for API keys. **NOTE: DO NOT COMMIT THIS FILE SINCE IT CONTAINS SENSITIVE INFO** (It should be ignored by default even if you do `git add .`, just don't add it on purpose)
 - `nodemon bin/www`
 - Navigate to `localhost:3000`

To install a new node module (these are like Python libs):

- `npm install module_name --save`  (This installs it in node_modules and also adds it into package.json - which is like requirements.txt). Do not use `sudo`