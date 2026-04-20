# Hall of Fame

Researchers who reported legitimate vulnerabilities and helped make the service harder to break.

To get listed here see [VDP](/security) page.

---

# Findings
> **N/A** marks vulns or bugs we found ourselves. Hall of Fame isn't ego fuel for our own handles. It exists to credit researchers who actually reported shit through responsible disclosure.   
> **Declined** means the finder opted out of having their nickname or pseudo listed on the VDP. They still did the disclosure the right way.

## 2026

### Apr 20, 2026
---

* **[RESEARCHER]**: Declined  
* **[STATUS]**: Patched  
* **[SEVERITY]**: Low  
* **[IMPACT]**: Some third-party systems blast messages straight to the generic `mail@domain.com` address.  
* **[DESCRIPTION]**: Handle **"mail@"** was available to claim. A security researcher claimed it clean and started pulling automated emails from random third-party systems, including sensitive password-reset notifications. Root cause: plenty of servers still blast messages straight to the generic mail@ address. **nomail** was already blacklisted. **mail** never made the cut.   

### Apr 13, 2026
---

* **[RESEARCHER]**: N/A
* **[STATUS]**: Patched
* **[SEVERITY]**: Critical
* **[IMPACT]**: Aliases, Creation and revocation of API keys (consequently, creation and disabling of active aliases)
* **[DESCRIPTION]**: Email verification bypassed via handle registration. Backend confirmations routed straight through Postfix's forwarding cleanup daemon. Registering a handle let the attacker tweak aliases and redirect mail to boxes they controlled.