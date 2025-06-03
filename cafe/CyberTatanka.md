## CYBERTATANKA ##
### LABS
Link - https://github.com/strandjs/IntroLabs/tree/master/IntroClassFiles/Tools/IntroClass
Base64 converter -> https://gchq.github.io/CyberChef/


### LINUX ###
Here's a cleaned-up and more coherent version of your notes, organized by Linux directory and command with clear explanations:

---

### **Basic Linux Commands & Concepts**

* `echo $PATH`
  Displays the system's PATH environment variable, showing directories where executable files are searched. Usually includes the `/bin` and `/usr/bin` directories.

* `which echo` / `which ls` / `which id`
  These commands show the absolute path of the executable that will be run when you type a command (e.g., `echo`, `ls`, or `id`) in the terminal.

---

### **Important Linux Directories and Commands**

* `cd /boot`
  Navigates to the `/boot` directory, which contains files related to booting the system, including kernel versions.

  * `ls /boot` will list available kernel versions.
  * You can roll back to an earlier kernel version if needed (e.g., after a failed update).

* `cd /dev`
  The `/dev` directory holds device files. In Linux, almost **everything is treated as a file**, including hardware devices (e.g., `/dev/sda`, `/dev/tty`, etc.).

* `tty`
  Prints the file name of the terminal connected to the standard input (e.g., `/dev/pts/0`).

  * If a command expects a TTY (terminal-type interface) and it's not available, it may throw an error.

* `cd /etc`
  Contains **configuration files** for the system and installed tools.

  * Despite the confusion, **executables do not reside here**—only config files (like `sshd_config`, `fstab`, etc.) do.

* `cd /lib`
  Holds **shared libraries**, similar to `.dll` files in Windows.

  * These support core binaries and applications.
  * **Library-based attacks**, like cache poisoning or library hijacking, can occur here.

* `cd /media`
  Typically used for mounting **removable media** (e.g., USB drives, CDs).

  * Mounting can seem complex, but it’s about attaching file systems for access.

* `cd /opt`
  Optional software packages are installed here, especially third-party apps not managed by the system package manager.

* `cd /proc`
  A **virtual file system** that exposes information about **running processes** and kernel status.

  * Each PID (process ID) gets its own directory (e.g., `/proc/1234`).
  * You can extract runtime data and memory mappings here—useful for forensics and debugging.

* `cd /sbin`
  Contains **system binaries**, typically used for system administration (e.g., `mount`, `reboot`, `iptables`).

  * Only accessible to the root user.

* `cd /tmp`
  Stores **temporary files**. Files here are often automatically deleted on reboot.

* `lsof +L1`
  Lists **open files that have been deleted** but are still being used by running processes.

  * Useful for identifying hidden or residual data.

* `cd /var`
  Contains **variable data** like logs (`/var/log`), mail spools, and web content (`/var/www`).

* if you want to make a directory hidden add a . infront of the directory. 


Here’s a cleaned-up and completed version of your notes with consistent formatting and brief explanations:

---

### 🔧 Networking & Process Inspection Commands

* **`ping <host>`**
  Sends ICMP echo request packets to test network connectivity and measure response time.

* **`nmap`**
  Network exploration tool used to discover hosts and services by sending packets and analyzing responses.

* **`nmap -sU -p 53 8.8.8.8`**
  Performs a UDP scan (`-sU`) on port 53 (DNS) of the target IP (`8.8.8.8`) to check if the port is open.

* **`netstat -nap`**
  Displays active network connections, routing tables, interface statistics, and associated processes (`-n` for numeric, `-a` for all, `-p` to show PID/program).

* **`lsof -i -P`**
  Lists open files related to internet connections and displays raw port numbers (`-i` for network files, `-P` to avoid port name resolution).

* **`lsof +L1`**
  Lists open files that have been deleted from the filesystem but are still held open by a process — useful for identifying file descriptor leaks.

* **`strings <file>`**
  Extracts printable strings from a binary file; often used in malware analysis or to inspect compiled binaries.

* **`/proc`**
  A virtual filesystem in Linux that provides detailed information about system processes and kernel parameters. It allows you to inspect or "scrape" runtime process details (e.g., `/proc/<PID>/`).

* **Command history tip**
  Prefixing a command with a space (e.g., `  ls`) prevents it from being logged in your shell history (if `HISTCONTROL=ignorespace` is set in the shell config).

---

* Get a book to learn how to use bash --- bash is used by every major linux distribution. If you learn bash you know what 
package manager they're using. 


