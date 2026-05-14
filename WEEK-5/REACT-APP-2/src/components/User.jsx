function User(props){
    const {userObj} = props;
    return(
        <div className="p-2 shadow-2xl rounded-4xl ring-2 flex flex-col justify-between items-center">
            <img className="w-fit" src={userObj.image} />
            <p>{userObj.name}</p>
            <p>{userObj.email}</p>
        </div>
    );
}

export default User;