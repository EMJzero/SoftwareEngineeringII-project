# RASD analysis assignment
Authors:
- Alessandro Sassi
- Marco Ronzani

Subject:
The provided RASD document presented for the A.Y. 2021-2022 Software Engineering 2 project.

## Purpose
- Seeems fine, describes in a few words what is the overall goal of the DREAMS project.
### Goals
- The goals related to what the system should allow Agronomists to do are missing, we understood that this was a 2-team-members project hence did not need to consider agronomists, however including their goals just for completeness would have been better considering the later mentions to agronomists.

## Scope
- Does not contain an identification of the product as per a brief description of it, while it somewhat defines the application’s domain.
- Good identification of the geographical area that the system should cover and of the possible limitations of the systems due to such restriction.
### World Phenomena
- WP1 might be incomplete, since it might need to include all chores the farmers have to do to sustain their activity.
- WP3, more precision and specificity may be advised in regards to "incidents", since it doesn't seem to include meteorological events.

## Scenarios
- Unnecessary information that deviate from the core goal of the document shoud be removed, being concise and to the point without theatrical descriptions is heavily recommended. (Its more a joke than anything else, but Lars-Erik is a Sweedish name, its improper for a scenario set in India)
For instance we suggest removing the following sentences:
  - “After a long working day the farmer Johnny sits down at his computer and logs onto the DREAM website.”
  - “The farmer Sonny wakes up early in the morning and goes to sit down at the kitchen table.”
- We would have developed a bit more the scenario for topic discussion, as an example by adding some detail on how the communication flow in the forum behaves.

## UML Class Diagram
- Instead of relying on a written note, it would have been more appropriate to add sub-classes of User, each specializing it in Farmer, Policy Maker and Agronomist, restricting this way the possible relations that each can have with other objects (Ex: policy makers are the only ones that can create initiatives, in the current model even farmers would be able to do this).
- Doing as said in point above would have allowed ProductSuggest to be related to Agronomists. Anyhow ProductSuggest should have not been left by itself anyway, since it can be “consulted” by the farmers it affects.

## Product Functions
- It says that the forum will be moderated, but there is no scenario or anything else concerning that.

## User characteristics
- Unregistered farmer might still be considered as a user, since it has to interact with the Login functions of the system. Hence Unregistered farmer might be an unnecessary User.
- Rather than mentioning the different type of users for the first time in this section, we would have found it more coherent to at least identify them immediately before or after discussing the scenarios, using this sections only to go into more details. 

## Domain Assumptions
- D4 and D5 would have been clearer if Agronomists were previously considered at least in minimal part, although not part of the project for a team of 2.  
- D8 regarding policy makers accounts can be more specific as to how this account with privileges is granted and authorized, furthermore since we are talking about a different user type mentioning "privileges" is rather inappropriate unless the hierarchy of privileges within the system has already been well define, which has not. Hence D8 should have just cited the different account type for policy makers being granted through proper means, not mentioning privileges.
- D7 and D9 are heavy assumptions that are not required. The system to be should be perfectly able to operate even if some provided data is incorrect or if some farmers do not provide their data, even more the eventuality of handling such cases should be considered in the system's behaviour, such as, for example, notifying a farmer to remind him to insert its data every month or year. 

## Requirements
### User Interfaces
- Should have been a better description of what "ease of use" means in the current context.
- The above can be said as well about the term "user-friendly".
### Functional Requirements
- In R13 We think there is an error in the usage of the word “authenticate”. “Verify” would have been much more appropriate.
- In R15 through R18 “author” is not specified to be an instance of farmer.
- R20 and R21 have improper or unclear usage phrasing.
- Is "The system must allow a farmer that creates a help request to be anonymous" really a requirement? Does it need to be an anonymous forum? If it really needs to be there it would have been better to have it as a possibility rather than imposition (see also Use Case 3 where the anonymous requests appears to be ambiguous: is it mandatory or optional?). Since the anonymity requirement is not clearly present in the description of the problem, nor is implied by it in any way, it would have been better to not include it all together.
- Consistent usage of modals is recomended: always use "should be able to/allow/" instead of "must".
### Performance
- The meaning of "light-weight" is not further specified. Does it have to run on "potato laptop" (technical term) as well as similarly low power machine like cheap smartphones or is it only a network capacity constraint?
- Broadband term is used improperly, network connection capacity might have been more appropriate.
- Be able to "handle 100K concurrent users" is state without providing any clear motivation (inferred: that is the order of magnitude of the number of farmers in the region) or reference to validate it.
### Design Constraints
#### Standards compliance
- It is useless to comply with GDPR since the target is the population in India, not the EU. The phrase should have limited itself to compliance with Indian law.
#### Hardware limitations
- Both the user's hardware and the system provider's hardware should have been taken into consideration. Given the requirement to allow even old devices to be able to use the system, imposing complete compatibility with old Web Browsers (Ex: Chromium v28) might have been usefull.
### Software System Attributes
#### Reliability
- Discussing the eventual multi-instance deployment of the system should have been discussed in the design constraints, it's of no use if casually mentioned here without a proper justification. Furthermore the described "parallel system" used as a backup is not an effective way of sustaining the previously cited 100k concurrent users. Since digressing into RIA deployment architectures is pointless in a RASD document, the whole topic should have been handled via a simple "the infrastructure upon which the website will be deployed will need to be chosen for reliability as well".
#### Availability
- The phrasing in the first paragraph is not entirely correct.
- A proper justification for the "99%" uptime specified should have been provided.
- Again the deployment infrastructure is discussed without this being the place for it, at this point a dedicated sections should have been inserted to contain all the needs regarding to it. On the same topic, simply mentioning "database duplication" as a mean to take an instance down while maintenance is performed on the other is a big semplification of a complex procedure given the estimated amount of concurrent users.
#### Security
- Requiring "high standard" security without defining what it means could have been avoided.
- The "in practice" paragraph is out of place for a RASD document and even if were to be included is incomplete to say the least.
#### Maintainability
- "Adhere to some set of software patterns" is surely not in itself a way to improve software maintainability, it only helps if the documentation is always kept up to date with changes, with the architectures and patterns being used to improve the quality of documentation and comments, since they exist to easily allow developers to quickly get a grasp of a system's structure. Hence the phrase should have been posed with a better understanding of the matter.
#### Portability
- Its more or less complete.