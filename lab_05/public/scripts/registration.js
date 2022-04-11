const Registration = (function() {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `avatar`    - The avatar of the user
    // * `name`      - The name of the user
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function(username, avatar, name, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
            const info = {"username": username, "avatar": avatar, "name": name, "password": password}
        //
        // B. Sending the AJAX request to the server
        //
            fetch("/register",{
                method: "POST",
                headers: {"Content-Type":
                        "application/json"},
                body: JSON.stringify(info)
            })
        //
        // F. Processing any error returned by the server
        // J. Handling the success response from the server
        //
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success"){
                    onSuccess("You can sign in now.");
                }else if (onError) onError(json.error);
            })

            .catch((err) => {
                console.log(err);
            });
    //

    };

    return { register };
})();
