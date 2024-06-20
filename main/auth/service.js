import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()



const __dirname = path.dirname(fileURLToPath(import.meta.url));


const usersDir = path.join(__dirname,'../users');
const usersFilePath = path.join(usersDir, 'users.json');

if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
    console.log("users.json file created");
}

class AuthService {
    register = async (req, res, next) => {
        try {
            const body = req.body;
            const {email,password}=body
            const userId = uuidv4();
            fs.readFile(usersFilePath, 'utf8', async (err, data) => {
                console.log("data",data)
                if (err) {
                    console.error("Error reading users file:", err);
                    return res.status(500).json({ message: 'Failed to register user' });
                }

                let users;
                try {
                    users = JSON.parse(data);
                } catch (parseError) {
                    console.error("Error parsing users file:", parseError);
                    users = [];
                }
                
                const emailExist=users.some(user=>user.email===email)
                if(emailExist){
                    return res.status(400).json({
                        result:{},
                        message:"Email already Exists",
                        meta:null
                    })
                }
                const hashedpassword=await bcrypt.hash(password,10)


                // Append the new user data
                const newUser = { id: userId, ...body,password:hashedpassword };
                console.log("newuser",newUser)
                users.push(newUser);

                // Write the updated array back to users.json
                fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        console.error("Error writing user data:", err);
                        return res.status(500).json({ message: 'Failed to register user' });
                    }
                    console.log('User data saved successfully');
                    res.status(200).json({
                        result:{
                            newUser:newUser.email
                        },
                        message: 'User registered successfully',
                        meta:null
                    });
                });
            });
        } catch (exception) {
            console.error("Exception:", exception);
            res.status(500).json({ 
                result:{},
                message:"Error",
                meta:null
            });
        }
    }

    login=async(req,res,next)=>{
        try{

            const {email,password}=req.body

            fs.readFile(usersFilePath, 'utf8', async (err, data) => {

                if(err){
                    console.error("Error reading users file:", err);
                    return res.status(500).json({ message: 'Failed to register user' });
                }
                let users;
                try {
                    users = JSON.parse(data);
                } catch (parseError) {
                    console.error("Error parsing users file:", parseError);
                    users = [];
                }
                
                const user=users.find(user=>user.email===email)
               if(!user){
                return res.status(401).json({
                    result:{},
                    message:"Invalid email"
                })
               }
              
               if (!user.password) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            

               const passMatch=await bcrypt.compare(password,user.password);

               if(passMatch){
                const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '4h' });
                const refreshToken = jwt.sign({ id: user.id, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.status(200).json({
                    result: { email, accessToken, refreshToken },
                    message: 'Login successful',
                    meta:null
                });
               }else{
                return res.status(401).json({
                    result:{},
                    message:"Password doesn't match",
                    meta:null
                })
               }


            })

        }
        catch(exception){
            console.log("Exception",exception)
            res.status(500).json({
                result:{},
                message:"Error",
                meta:null
            })
        }
    }

}

const AuthSvc = new AuthService();
export default AuthSvc;
