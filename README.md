# custom-dsl
      
Minimalist cucumber-like to study how a Domain Specific Language works.
                                                                       
## Commands 

Build: `npm run build`

Run with args (need build before): 
```
$ npm start './path-to-dot-feat'
OR
$ FEAT_PATH='./path-to-dot-feat' npm start (not working on windows cli)
``` 


Run without args (need build before): `npm run start-test` 

Run test: `npm run test`
 
## Examples
Output examples :

_Everything going well_

![success.png](readme_assets/success.png)

_Something goes bad_

![failed.png](readme_assets/failed.png)