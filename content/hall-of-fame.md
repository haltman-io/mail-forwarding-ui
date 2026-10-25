# Hall of Fame

Researchers who reported legitimate vulnerabilities and helped make the service harder to break.

## 2026

### Oct 24, 2026
---

* **[RESEARCHER]**: sneed  
* **[STATUS]**: Patched  
* **[SEVERITY]**: Critical  
* **[IMPACT]**: Unauthorized interception and hijacking of inbound emails sent to any alias or handle whose external destination local-part was not yet registered as a handle.  
* **[DESCRIPTION]**: Recursive `virtual_alias_maps` resolution in Postfix's `cleanup(8)` daemon paired with an unscoped `%u` lookup in `mysql-virtual-handles.cf`. After resolving an alias or handle to its external destination, Postfix evaluated the rewritten address against the handle map without verifying that `%d` belonged to an active hosted domain. Claiming the external destination's local-part as a handle let an attacker hijack inbound mail mid-flight and redirect it to boxes they controlled.  

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