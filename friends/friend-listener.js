import watch from "node-watch";
import shell from "shelljs";

watch("./friends/friend-images", { recursive: true }, (evt, name) => {
    if (shell.exec('git add -A friends/friend-images/\*').code == 0) {
        if(shell.exec('git commit -m "Friend images updated"').code == 0) {
            shell.exec('git push');
        } else {
            console.log("Error committing files");
        }
    } else {
        console.log("Error adding files");
    }
});