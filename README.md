# nodeadvertise
Rules for completing the course:

Final test date: June 26, 2022 (last meeting)

Assessment method:

    You prepare implementations of the functions you choose
    You send me solutions via email, Slack (I suggest not to put them in a public repository :))
    we discuss the prepared solution through Teams, Zoom, meet.jit.si:
        calendar https://calendly.com/***********
    if in doubt, you contact me via Slack, email

Grading scale:

    0-8 points → 2
    9-11 points → 3
    12-14 points → 3.5
    15-18 points → 4
    19-22 points → 4.5
    23 and more points → 5

Remarks

    You can use any version of Node.js> = 14.
    You can use any npm module (unless the task says otherwise)

Business goal:

The aim of the project is to create an application that allows you to manage online advertisements - a notice board.

Each ad has:

    title
    description
    author
    categories
    tags (multiple tags)
    the price
    ... (space for your ideas, the best ones will be additionally scored)

Graphical interface is not required. Functionality will be checked with Postman. Remember about error handling, endpoint naming,
handling HTTP methods and returned HTTP response codes.

Feature List:

0. [task necessary to pass] The application is documented with Postman - a collection containing examples of requests for all prepared functions
1. [1 point] The port used by the application should be set using environment variables
2. [1 point] The application responds to requests sent to the address / heartbeat with the current date and time
3. [1 point] The application allows you to add an advertisement
4. [2 points] The application allows you to return all ads and a single ad
5. [1 point] The application allows you to delete the selected advertisement
6. [1 point] The application allows you to modify the selected advertisement
7. [1 point for each search criterion / maximum 5 points] The application allows you to search for ads according to various criteria (title, description, date range,
   price range etc).
8. [4-8 points] The application saves the ads in the database [8 points] or files [4 points]
9. [2 points] Removing and modifying ads is secured with a password (e.g. middleware that verifies the password), in the absence of access, an appropriate message is returned
   and the HTTP response code. No production level security is required, rather a basic solution.
10. [4 points] The application has 3 permanently defined users, each of them can delete and modify only those ads that he added himself,
    if no access is available, an appropriate message and HTTP response code are returned
11. [3 points] After starting the application with a parameter (e.g. node app.js debug), it saves the time of receipt of each request in the file,
    HTTP method and the address to which the request was made
12. [2 points] The application, after receiving a request to an address that does not exist, should return a static image instead of the default 404 error page
13. [2 points] In the event of application errors, the error details are saved in console.log and the user receives an appropriate message and HTTP response code



# Zasady zaliczenia przedmiotu

Ostateczny termin zaliczenia: 26.06.2022 (ostatni zjazd)

Sposób zaliczenia:

    przygotowujesz implementacje wybranych przez siebie funkcji
    przesyłasz mi rozwiązania poprzez email, Slack (sugeruje nie umieszczać ich w publicznym repozytorium :) )
    omawiamy przygotowane rozwiązanie poprzez Teams, Zoom, meet.jit.si:
        kalendarz https://calendly.com/pawel-lukaszuk-jsd/nodejs
    w razie wątpliwości kontaktujesz się ze mną za pomocą Slack, email

Skala ocen:

    0-8 pkt → 2
    9-11 pkt → 3
    12-14 pkt → 3.5
    15-18 pkt → 4
    19-22 pkt → 4.5
    23 i więcej pkt → 5

Uwagi

    Możesz użyć dowolnej wersji Node.js 

    14.
    Możesz użyć dowolnego modułu npm (o ile zadanie nie mówi inaczej)

Cel biznesowy

Celem projektu jest stworzenie aplikacji pozwalającej na zarządzanie ogłoszeniami online - tablica ogłoszeń.

Każde ogłoszenie ma:

    tytuł
    opis
    autora
    kategorię
    tagi (wiele tagów)
    cenę
    ... (miejsce na Twoje pomysły, najlepsze będą punktowane dodatkowo)

Interfejs graficzny nie jest wymagany. Funkcjonalność będzie sprawdzona przy pomocy Postmana. Należy pamiętać o obsłudze błędów, nazewnictwie endpointów, obsłudze metod HTTP oraz zwracanych kodów odpowiedzi HTTP.

Lista funkcji:

    [zadanie konieczne do zaliczenia] Aplikacja jest udokumentowana za pomocą Postmana - kolekcją zawierającą przykłady żądań do wszystkich przygotowanych funkcji
    [1 punkt] Port z którego korzysta aplikacja powinien być ustawiany za pomocą zmiennych środowiskowych
    [1 punkt] Aplikacja na żądania wysłane pod adres /heartbeat odpowiada zwracając aktualną datę i godzinę
    [1 punkt] Aplikacja umożliwia dodawanie ogłoszenia
    [2 punkty] Aplikacja umożliwia zwracanie wszystkich ogłoszeń oraz pojedynczego ogłoszenia
    [1 punkt] Aplikacja umożliwia usuwanie wybranego ogłoszenia
    [1 punkt] Aplikacja umożliwia modyfikowanie wybranego ogłoszenia
    [1 punkt za każde kryterium wyszukiwania/maksymalnie 5 punktów] Aplikacja pozwala na wyszukiwanie ogłoszeń według różnych kryteriów (tytuł, opis, zakres data, zakres ceny itp).
    [4-8 punktów] Aplikacja zapisuje ogłoszenia w bazie danych [8 punktów] lub plikach [4 punkty]
    [2 punkty] Usuwanie i modyfikowanie ogłoszeń jest zabezpieczone hasłem (np. middleware weryfikujące hasło), przy braku dostępu zwracany jest stosowny komunikat i kod odpowiedzi HTTP. Nie jest wymagane zabezpieczenie na poziomie produkcyjnym, raczej podstawowe rozwiązanie.
    [4 punkty] Aplikacja ma 3 zdefiniowanych na stałe użytkowników, każdy z nich może usuwać i modyfikować tylko te ogłoszenia które sam dodał, przy braku dostępu zwracany jest stosowny komunikat i kod odpowiedzi HTTP
    [3 punkty] Aplikacja po uruchomieniu z parametrem (np node app.js debug) zapisuje w pliku czas odebrania każdego żądania, metodę HTTP oraz adres na który przyszło żądanie
    [2 punkty] Aplikacja po odebraniu żądania do adresu który nie istnieje powinna zwracać statyczny obrazek zamiast domyślnej strony błędu 404
    [2 punkty] W przypadku wystąpienia błędów aplikacji, szczegóły błędu zapisywane są w console.log a użytkownik dostaje stosowny komunikat i kod odpowiedzi HTTP

