import watch from "node-watch";
import shell from "shelljs";

watch("./friends/friend-images", { recursive: true }, (evt, name) => {
    if (shell.exec('git add -A').code == 0) {
        shell.exec('git commit -m "Friend images updated"');
    } else {
        console.log("Error adding files");
    }
});