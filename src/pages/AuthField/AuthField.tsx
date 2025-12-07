import { useState } from "react"
import "./AuthField.css"
import iconEye from "/src/assets/eye.png"
import iconHidden from "/src/assets/hidden.png"
import { useNavigate } from "react-router-dom"
import samgtuLogo from "/src/assets/samgtu_logo.png"


export const AuthField = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [passType, setPassType] = useState('password');

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate();
    
    const handlePasswordVisibility = (
        passVisible: boolean = isPasswordVisible, 
        passTypeInput: string = passType
    ) => {
        setPassType(passTypeInput === 'password' ? 'text' : 'password')
        setIsPasswordVisible(!passVisible)
    }

    const handleLogin = (isLogin: boolean) => {
        setIsLogin(isLogin)
        handlePasswordVisibility(true, 'text') //Инвертируем

        setName('')
        setEmail('')
        setPassword('')
    }

    const OnSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (email.trim() == 'admin@admin' && password.trim() == 'admin') {
            //TODO: route to /main
        }
        navigate('/main');
        
    }

    const OnSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
        //TODO: доделать регистрацию
        alert('Регистрация')
        e.preventDefault()
    }

    return (
       <>
       <div className="auth-field">
           <div className="login-field">
            {
                isLogin
                ? 
                <div className="login-field-form">
                    <form className="login-form" onSubmit={OnSubmitLogin}>
                        <h1 className="title-form">Вход</h1>
                        <p><input 
                            type="email" 
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /></p>
                                
                        <p className="form-password-field">
                            <input 
                                className= "form-password-input" 
                                type={passType} 
                                placeholder="пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={isPasswordVisible ? iconEye : iconHidden}
                                className="eye-icon"
                                alt="show"
                                onClick={() => handlePasswordVisibility()}
                            />
                        </p>
                        <p><button>продолжить</button></p>
                    </form>
                    <p><button className="another-form-button" onClick={() => handleLogin(false)}>регистрация</button></p>
                </div>
                :
                <div className="login-field-form">
                    <form className="login-form" onSubmit={OnSubmitRegister}>
                        <h1 className="title-form">Регистрация</h1>
                        <p><input 
                            type="text" 
                            placeholder="имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        /></p>
                        <p><input 
                            type="email" 
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /></p>
                        <p className="form-password-field">
                            <input 
                                type={passType} 
                                className= "form-password-input" 
                                placeholder="пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={isPasswordVisible ? iconEye : iconHidden}
                                onClick={() => handlePasswordVisibility()}
                                className="eye-icon"
                                alt="show"
                            />
                        </p>
                        <p><button>продолжить</button></p>
                    </form>
                    <button className="another-form-button" onClick={() => handleLogin(true)}>войти</button>
                </div>
            }
            </div>
       </div>
        <div className="logo-anchor">
            <img className = "samgtu-logo" src={samgtuLogo} />
        </div>
       </>
    )
}